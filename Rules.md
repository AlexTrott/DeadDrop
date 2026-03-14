# Dead Drop — Official Rules

## Overview

Dead Drop is a 1v1 turn-based card game. Each player commands a team of **3 gig workers** (one 1★, one 2★, one 3★) and a **deck of 20 item cards**. Players take alternating turns using mana to play items, activate abilities, and battle. The first player to **knock out all 3 of their opponent's workers** wins.

---

## Setup

### 1. Team Selection
Each player selects **3 gig worker units** — one from each tier (1★, 2★, 3★). The same worker cannot appear on both teams.

### 2. Deck Building
Each player builds a deck of exactly **20 item/spell cards** from the available card pool. Duplicate cards are allowed (max 2 copies of any single card).

### 3. Starting the Game
1. Each player's **1★ unit** automatically starts as the active unit. The 2★ and 3★ wait in reserve.
2. Each player shuffles their item deck.
3. Each player draws **3 cards** into their starting hand.
4. A coin flip determines who goes first.

> **First-turn rule**: The player who goes first skips their first draw phase (they do NOT draw a card on turn 1). This compensates for the tempo advantage of going first.

---

## Tier Progression

Units fight in a **forced progression** — 1★ → 2★ → 3★:

- Your **1★ unit** starts active. When it's KO'd, your **2★ unit** automatically enters.
- When your 2★ is KO'd, your **3★ unit** enters.
- When your 3★ is KO'd, you **lose the game**.

There is no voluntary swapping. Units cannot be swapped in and out freely.

### Retreat (Sacrifice)
A player may choose to **retreat** their active unit, which **KO's it immediately** and brings in the next tier:

| Current Tier | Retreat Cost |
|---|---|
| 1★ → 2★ | 2 mana |
| 2★ → 3★ | 4 mana |
| 3★ | Cannot retreat (last unit) |

Retreat is a strategic sacrifice: you lose a unit but bring in a stronger one early.

---

## Tier Stat Bands

Units are balanced into strict tier bands:

| Stat | 1★ (Fodder) | 2★ (Core) | 3★ (Boss) |
|---|---|---|---|
| HP | 14-20 | 24-32 | 38-50 |
| Attack | 2-4 | 4-6 | 6-8 |
| Basic ability cost | 1 mana | 2-3 mana | 3-4 mana |
| Ultimate ability cost | 3-4 mana | 5-6 mana | 7-9 mana |

---

## Game Zones

| Zone | Description |
|---|---|
| **Active Slot** | Your current fighting worker. Only this unit can attack, be attacked, and use abilities. |
| **Reserve** | Your waiting 2★ and/or 3★ units. They enter automatically when the current active unit is KO'd. |
| **Hand** | Your item/spell cards. Visible only to you. No maximum hand size. |
| **Deck** | Your remaining item cards, face-down. When the deck is empty, you simply stop drawing. |
| **Discard Pile** | Played item cards go here. Cards are not recycled in MVP. |

---

## Turn Structure

Each turn follows this sequence:

### Phase 1: Start of Turn
- Gain **+1 max mana** (up to a maximum of 10)
- **Refill mana** to your current max
- Trigger any **start-of-turn effects** (e.g. Poison damage ticks here)
- If the active unit is KO'd by a start-of-turn effect, the next tier unit **automatically enters**

### Phase 2: Draw Phase
- Draw **1 card** from your item deck
- If the deck is empty, skip this phase

### Phase 3: Main Phase
During the main phase, the active player may perform **any combination** of the following actions, in any order, as long as they have the mana to pay:

| Action | Mana Cost | Details |
|---|---|---|
| **Basic Attack** | 0 (free) | Deal your active unit's base attack damage to the opponent's active unit. **Once per turn.** |
| **Use Basic Ability** | Varies (printed on card) | Activate your active unit's basic ability. **Once per turn.** |
| **Use Ultimate Ability** | Varies (printed on card) | Activate your active unit's ultimate ability. **Once per turn.** |
| **Play Item Card** | Varies (printed on card) | Play an item card from your hand. Resolve its effect immediately. **No limit per turn.** |
| **Retreat** | 2 mana (1★) or 4 mana (2★) | Sacrifice your active unit and bring in the next tier. Cannot retreat from 3★. **Once per turn.** |

> **Important**: You may use a basic attack AND an ability in the same turn (they are separate actions). You cannot use the same ability twice in one turn.

### Phase 4: End of Turn
- Trigger any **end-of-turn effects**
- Decrement duration of timed status effects (Boost, Slow, etc.)
- Pass the turn to the opponent

---

## Combat

### Basic Attack
Every unit has a base **Attack** stat. A basic attack deals that much damage to the opponent's active unit. Basic attacks are free (0 mana) and can be used once per turn.

### Abilities
Each worker has **2 abilities**:

- **Basic Ability**: Low mana cost. Reliable, can be used early. Examples: bonus damage, minor heal, apply a light debuff.
- **Ultimate Ability**: High mana cost. Powerful, game-swinging. Examples: massive damage, full heal, powerful status effects.

Abilities may deal damage, heal, apply status effects, or have unique mechanics. The ability's card text is the definitive source of its effect.

### Damage Resolution
1. Calculate base damage (attack stat or ability damage)
2. Apply any **Boost** modifiers (active unit's attack buffs)
3. Apply any **Shield** on the defending unit (absorb damage, reduce shield amount)
4. Subtract remaining damage from the defender's **HP**
5. If HP reaches 0, the unit is **knocked out**

### Knock Out (KO)
When a unit's HP reaches 0:
1. The unit is KO'd and removed from play
2. The **next tier unit automatically enters** (no player choice)
3. If no units remain, that player **loses the game**

---

## Status Effects

Status effects are applied by abilities and item cards. A unit can have multiple different status effects simultaneously. The same status effect does **not stack** — reapplying it **refreshes** the duration/potency.

| Effect | Icon | Behaviour |
|---|---|---|
| **Poison** | 🟢 | At the start of the poisoned unit's owner's turn, deal X damage to the unit. Lasts until cured or unit is KO'd. |
| **Shield** | 🛡️ | Absorbs the next X points of damage. When damage is dealt, reduce shield first. Shield has no duration — it persists until broken or the unit is KO'd. |
| **Boost** | ⬆️ | +X to attack stat. Lasts N turns (decrements at end of turn). |
| **Slow** | 🐌 | All abilities cost +1 additional mana. Lasts N turns (decrements at end of turn). |

### Status Effect Rules
- Effects are tied to the **unit**. Poison ticks on all units at start of their owner's turn.
- Shield only absorbs damage to the unit it's on.
- Boost and Slow only apply while the unit is active.
- Status effects can be removed by specific item cards (e.g. "Antidote Smoothie" removes all effects).

---

## Mana System

| Turn | Max Mana |
|---|---|
| 1 | 1 |
| 2 | 2 |
| 3 | 3 |
| ... | ... |
| 10+ | 10 (cap) |

- Mana **fully refills** at the start of each turn
- Unspent mana does **not** carry over
- All costs are paid from the same mana pool (abilities, items, retreat)

---

## Item Cards

Item cards are played from hand during the Main Phase. They cost mana, resolve immediately, and are then discarded.

### Item Types

| Type | Effect |
|---|---|
| **Healing** | Restore HP to your active unit (or all allies) |
| **Damage** | Deal damage directly to the opponent's active unit |
| **Buff** | Apply a positive status effect (Shield, Boost) to your unit |
| **Debuff** | Apply a negative status effect (Poison, Slow) to the opponent's unit |
| **Utility** | Special effects: draw extra cards, cleanse effects, etc. |

### Card Limits
- Max **2 copies** of any single item card in a deck
- Deck size is exactly **20 cards**
- No maximum hand size

---

## Special Rules

### Fatigue
When your item deck runs out and your deck is empty at start of turn, your active unit takes escalating fatigue damage: `max(1, turnNumber - 10)` per turn.

### Ties
If both players' last units are KO'd simultaneously (e.g. Poison ticks on both), the **player whose turn it is loses** (the defending player wins).

### Card Text Overrides Rules
If an item card or ability explicitly contradicts a general rule, the **card text takes priority**.

---

## Glossary

| Term | Definition |
|---|---|
| **Active Unit** | The worker currently fighting |
| **Reserve** | Your waiting higher-tier workers |
| **KO** | Knocked Out — when a unit reaches 0 HP |
| **Mana** | Resource spent to use abilities, play items, and retreat |
| **Retreat** | Sacrifice your active unit (costs mana) to bring in the next tier |
| **Tier (★)** | Unit power level: 1★ (fodder), 2★ (core), 3★ (boss) |
| **Status Effect** | An ongoing modifier on a unit (Poison, Shield, Boost, Slow) |
| **Basic Attack** | A free attack using the active unit's Attack stat |
| **Basic Ability** | The cheaper of a unit's two abilities |
| **Ultimate Ability** | The more expensive, powerful ability |
| **Item Card** | A spell/item played from hand to create an immediate effect |

---

## Quick Reference Card

```
┌─────────────────────────────────────────┐
│           Dead Drop — TURN             │
│                                         │
│  1. START:  +1 max mana, refill, ticks  │
│  2. DRAW:   Draw 1 item card            │
│  3. MAIN:   Any combo of:               │
│     ⚔️  Basic Attack (free, 1/turn)     │
│     ✨  Basic Ability (mana, 1/turn)    │
│     💥  Ultimate Ability (mana, 1/turn) │
│     🃏  Play Item Cards (mana, no limit)│
│     🏳️  Retreat (2/4 mana, sacrifice)   │
│  4. END:    Effects tick, pass turn      │
│                                         │
│  PROGRESSION: 1★ → 2★ → 3★ (on KO)    │
│  WIN: KO all 3 opponent workers         │
└─────────────────────────────────────────┘
```
