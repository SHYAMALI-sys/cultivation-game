# Path of Immortal Ascension

A browser-based cultivation incremental game built with React, TypeScript, Vite, and Tailwind CSS.

## Gameplay

- **Cultivate Qi:** meditate to steadily increase your Qi, improve your cultivation speed, and work toward the next realm.
- **Explore the wilderness:** complete expeditions for random discoveries, herbs, materials, Qi, and spirit stones.
- **Break through realms:** spend the required Qi and take a probabilistic breakthrough attempt. Failed attempts scatter part of your Qi.
- **Hunt spirit beasts:** spend spirit stones to enter a combat encounter. Victory grants loot, Qi, spirit stones, and combat mastery; defeat costs 10% of current Qi.
- **Train techniques and practice alchemy:** improve learned techniques and craft pills from gathered materials.
- **Follow the Spirit Mind Advisor:** review live realm progress, estimated breakthrough odds, time-to-target, training opportunities, combat readiness, and achievement milestones.

## Intelligence and analytics

The in-game advisor is a deterministic, local rules engine. It analyses the current save state and explains its recommendations. It does not call an external AI service and does not require an API key.

Breakthrough and hunting odds are estimates; the actual outcomes remain random. Time-to-target assumes uninterrupted meditation and the current cultivation bonuses.

## Getting started

Requirements: Node.js 20 or later and npm.

```bash
npm install
npm run dev
```

Vite serves the game at http://localhost:3000.

## Checks

```bash
npm run typecheck
npm run build
```

## Save data and privacy

The game automatically saves to this browser's local storage every five seconds and when the page is closed. Save data stays in the browser unless the player clears it. Use **Reset Game** in the interface to start over.

## Project structure

- `src/App.tsx` — application layout and panel composition
- `src/hooks/useGameState.ts` — game loop, actions, progression, and local save handling
- `src/gameData.ts` — realms, items, techniques, exploration events, and recipes
- `src/components/AdvisorPanel.tsx` — strategic recommendations and progression analytics
- `src/components/ActionPanel.tsx` — cultivation, exploration, hunting, and breakthrough actions
