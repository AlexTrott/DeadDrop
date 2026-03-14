# CLAUDE.md — Dead Drop: AI Coding Guide

## Project Overview

**Dead Drop** is a web-based collectible card game (CCG) where players assemble teams of gig economy workers (Deliveroo riders, Uber drivers, Amazon couriers, etc.) and battle in tactical, turn-based combat. Think **Pokemon meets Hearthstone** — Pokemon-style unit swapping with Hearthstone's mana curve, wrapped in a gig economy theme.

## Tech Stack

- **Framework**: React with Vite (TypeScript)
- **Styling**: CSS Modules or Tailwind CSS
- **State Management**: Zustand (lightweight, good for game state)
- **Art**: Placeholder emoji-based art for MVP — no image assets required
- **AI Opponent**: Local AI opponent for MVP (no server required for single-player)
- **Architecture**: Client-side game engine with state machine, designed to be extractable for future multiplayer (WebSocket-ready)

## Project Structure

```
src/
├── engine/              # Core game logic (framework-agnostic)
│   ├── GameState.ts     # Central game state type definitions
│   ├── GameEngine.ts    # Turn logic, mana, win conditions
│   ├── CombatSystem.ts  # Damage calc, abilities, status effects
│   ├── CardEffects.ts   # Item/spell card effect implementations
│   ├── AIOpponent.ts    # AI decision-making
│   └── constants.ts     # Balance numbers, config
├── data/
│   ├── workers.ts       # All gig worker unit definitions
│   ├── items.ts         # All item/spell card definitions
│   └── decks.ts         # Preset deck configurations
├── components/
│   ├── Game/            # Main game board, turn UI
│   ├── Card/            # Card rendering (unit cards, item cards)
│   ├── Battle/          # Active unit, bench, combat animations
│   ├── Hand/            # Player hand display
│   ├── DeckBuilder/     # Pre-game deck selection
│   └── UI/              # Shared UI components (mana bar, HP bar, etc.)
├── hooks/               # React hooks for game state subscriptions
├── types/               # Shared TypeScript types
└── utils/               # Helpers (shuffle, random, etc.)
```

## Key Architecture Principles

### 1. Separate Engine from UI
The `engine/` folder must contain **zero React imports**. It is pure TypeScript game logic. This ensures:
- The engine can be tested without rendering
- The engine can be moved to a server for multiplayer without refactoring
- AI opponent logic runs against the same engine players use

### 2. State Machine Approach
The game runs as a **state machine** with clearly defined phases:
```
DECK_SELECT → GAME_START → DRAW_PHASE → MAIN_PHASE → COMBAT_PHASE → END_PHASE → (loop or GAME_OVER)
```
Every action is a **transition** that takes current state and returns new state. No mutations.

### 3. Action-Based System
All player/AI actions are serialisable objects:
```typescript
type GameAction =
  | { type: 'PLAY_CARD'; cardId: string; target?: string }
  | { type: 'USE_ABILITY'; abilityIndex: 0 | 1; target?: string }
  | { type: 'SWAP_UNIT'; benchIndex: number }
  | { type: 'ATTACK' }
  | { type: 'END_TURN' }
```
This makes the game replayable, networkable, and AI-compatible.

### 4. Multiplayer-Ready Design
Even though MVP is local AI only:
- All game logic flows through the engine, never directly from UI
- Player actions are serialisable (can be sent over WebSocket later)
- Game state is fully deterministic given the same action sequence
- Random events (deck shuffle, draw) use seeded RNG where possible

## Core Game Rules (Quick Reference)

See `rules.md` for full rules. Key numbers for implementation:

| Parameter | Value |
|---|---|
| Units per team | 3 |
| Active units at once | 1 (others on bench) |
| Item deck size | 15 |
| Starting hand | 3 items |
| Cards drawn per turn | 1 |
| Starting mana | 1 |
| Mana gain per turn | +1 |
| Max mana | 10 |
| Swap cost | 1 mana |
| Abilities per unit | 2 (basic + ultimate) |
| Win condition | KO all 3 opponent units |

## Card Data Format

### Gig Worker (Unit Card)
```typescript
interface GigWorker {
  id: string;
  name: string;           // e.g. "Deliveroo Cyclist"
  company: Company;       // DELIVEROO | UBER | AMAZON | JUST_EAT | etc.
  emoji: string;          // e.g. "🚴"
  hp: number;             // max HP
  attack: number;         // base attack damage
  abilities: [Ability, Ability]; // [basic, ultimate]
  flavourText: string;    // e.g. "Rain or shine, your pad thai arrives on time."
}

interface Ability {
  name: string;
  manaCost: number;
  damage?: number;
  effect?: StatusEffect;
  description: string;
}
```

### Item/Spell Card
```typescript
interface ItemCard {
  id: string;
  name: string;           // e.g. "Energy Drink"
  emoji: string;          // e.g. "🥤"
  manaCost: number;
  type: 'HEALING' | 'DAMAGE' | 'BUFF' | 'DEBUFF' | 'UTILITY';
  effect: CardEffect;
  description: string;
  flavourText: string;
}
```

## AI Opponent Design

The AI should use a **priority-based decision system** for MVP:
1. If active unit is low HP and bench has healthy units → consider swapping
2. If can use ultimate ability and it would KO the opponent → use it
3. If have a high-value item card and enough mana → play it
4. If enough mana for basic ability → use basic ability
5. Otherwise → basic attack or end turn

Do **not** over-engineer the AI. A simple priority system that makes "reasonable" plays is sufficient. It should feel like a competent opponent, not a perfect one.

## UI/UX Guidelines

- **Card-centric**: Cards should feel physical — rounded corners, subtle shadows, slight hover lift
- **Emoji art**: Use emoji as the primary visual on cards. Make them large and central
- **Company colours**: Each gig company gets a signature colour (Deliveroo teal, Uber black, Amazon orange, etc.)
- **Responsive**: Must work on desktop; tablet is a bonus; mobile is stretch
- **Animations**: Subtle CSS transitions for card plays, swaps, damage. Nothing heavy for MVP
- **Turn feedback**: Clear visual indication of whose turn it is, available mana, and valid actions

## Status Effects

Implement these for MVP:
- **Poison** 🟢: Deal X damage at start of afflicted unit's turn
- **Shield** 🛡️: Absorb next X damage
- **Boost** ⬆️: +X attack for N turns
- **Slow** 🐌: Abilities cost +1 mana for N turns

## Testing Strategy

- **Engine tests**: Unit test all game logic (combat, mana, abilities, win conditions)
- **AI tests**: Verify AI makes legal moves and doesn't crash
- **Integration tests**: Full game simulation — run 100 AI-vs-AI games without errors
- **No E2E tests for MVP** — manual UI testing is fine

## Common Pitfalls to Avoid

- ❌ Don't put game logic in React components
- ❌ Don't use `Math.random()` directly — use a seeded RNG utility
- ❌ Don't hardcode card stats in components — always reference data files
- ❌ Don't make the AI unbeatable — it should make occasional suboptimal plays
- ❌ Don't build multiplayer networking yet — just ensure the architecture supports it
- ❌ Don't create image assets — emoji only for MVP