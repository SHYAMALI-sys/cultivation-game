# Living Cultivation World — Implementation Plan

## Goal
Evolve the existing React/TypeScript incremental cultivation game into a persistent, time-driven world with meaningful regional travel, evolving encounters, cultivation paths, sect progression, disciple records, and danger/reward tradeoffs, while keeping the current game save and loop playable.

## Architecture
Keep the existing Vite + React + TypeScript client and localStorage save. Extend `GameState` compatibly, initialize defaults for older saves, and evolve time/events in the existing game hook. Put region/path/event content in game data and show the new systems in a focused world panel that calls explicit state actions; retain the existing action, inventory, technique, and advisor panels.

## Project structure
- `src/types.ts`: world, sect, path, disciple, and event record types.
- `src/gameData.ts`: paths, regions, sects, and non-repeating event templates.
- `src/hooks/useGameState.ts`: save migration, continuous world time, event generation, and world actions.
- `src/components/WorldPanel.tsx`: map/region selection, path selection, sect and disciple management, divine ability, and forbidden-route/heart-demon choices.
- `src/App.tsx`: place the world panel into the responsive game layout.
- `src/index.css`: restrained visual styling only if needed.

## Design
Three candidate aesthetics (tail probabilities): ink-wash celestial atlas 0.04; lacquered sect chronicle 0.06; astral frontier console 0.08. Choose **ink-wash celestial atlas**: use dark indigo as night-paper, muted jade and warm gold for route and sect signals, with map-like horizontal region cards and compact chronicle records. Core principles: narrative first, readable decisions, consequences visible, no noisy decoration. Signature motifs: constellation route lines, sect seals, and dated event entries. Interactions should make time and risk legible and keep destructive choices reversible where possible. Motion stays subtle and honors reduced-motion preferences. Brand essence: a quiet but reactive cultivation chronicle; observant, atmospheric, consequential. Voice: concise and evocative (e.g. “The mountain remembers your passage.” / “Heaven is watching this breakthrough.”). Mark: a jade seal encircled by a broken orbit. Signature color: deep jade.

## Scope decisions
- Preserve the existing save and default experience; older saves receive safe defaults for new fields.
- Model an in-world clock with elapsed-time catch-up capped at eight real hours per load, scheduled world events, and recurring character generation, instead of relying on a UI interval count.
- Add selectable regions with risk/reward variation, paths with distinct bonuses, one sect affiliation/contribution loop, recruitable generated disciples with capacity/cost, a divine ability with a cooldown, and persistent heart-demon/forbidden-route consequences.
- Generate new narrative records without immediately repeating the same event template; persist history and character identities.
- Keep combat/breakthrough chance formulas bounded and clamp currencies/Qi so event rewards cannot create negative resources or exceed caps.

## Implementation sequence
1. Extend the state/data schema and define world content.
2. Add backward-compatible save migration and elapsed-time/event/character progression.
3. Add world interaction actions and a responsive world panel.
4. Integrate the panel and world clock into the existing interface.
5. Run strict TypeScript checking, production build, inspect changed files, and perform a fresh repository-level review.
