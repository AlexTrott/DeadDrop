# Dead Drop — Official Rules

## Overview

Dead Drop is a 1v1 turn-based card game. Each player commands a team of **3 gig workers** and a **deck of 15 item cards**. Players take alternating turns using mana to play items, activate abilities, and swap units. The first player to **knock out all 3 of their opponent's workers** wins.

---

## Setup

### 1. Team Selection
Each player selects **3 gig worker units** from the available roster. The same worker cannot appear on both teams (unique draft — first pick locks it out for the opponent).

### 2. Deck Building
Each player builds a deck of exactly **15 item/spell cards** from the available card pool. Duplicate cards are allowed (max 2 copies of any single card).

### 3. Starting the Game
1. Both players choose which of their 3 workers starts as the **active unit**. The other 2 go to the **bench**.
2. Each player shuffles their item deck.
3. Each player draws **3 cards** into their starting hand.
4. A coin flip determines who goes first.

> **First-turn rule**: The player who goes first skips their first draw phase (they do NOT draw a card on turn 1). This compensates for the tempo advantage of going first.

---

## Game Zones

| Zone | Description |
|---|---|
| **Active Slot** | Your current fighting worker. Only this unit can attack, be attacked, and use abilities. |
| **Bench** | Your 2 reserve workers. They cannot act or be targeted (unless a card says otherwise). Bench units **do not heal** passively. |
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
- If the active unit is KO'd by a start-of-turn effect, the player must immediately swap in a bench unit (this swap is **free**)

### Phase 2: Draw Phase
- Draw **1 card** from your item deck
- If the deck is empty, skip this phase (no penalty)

### Phase 3: Main Phase
During the main phase, the active player may perform **any combination** of the following actions, in any order, as long as they have the mana to pay:

| Action | Mana Cost | Details |
|---|---|---|
| **Basic Attack** | 0 (free) | Deal your active unit's base attack damage to the opponent's active unit. **Once per turn.** |
| **Use Basic Ability** | Varies (printed on card) | Activate your active unit's basic ability. **Once per turn.** |
| **Use Ultimate Ability** | Varies (printed on card) | Activate your active unit's ultimate ability. **Once per turn.** |
| **Play Item Card** | Varies (printed on card) | Play an item card from your hand. Resolve its effect immediately. **No limit per turn** (spend mana, play cards). |
| **Swap Active Unit** | 1 mana | Move your active unit to the bench and bring a bench unit to the active slot. The new active unit **cannot attack or use abilities on the turn it swaps in** (swap sickness). You can still play item cards after swapping. **Once per turn.** |

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

- **Basic Ability**: Low mana cost (typically 1–3). Reliable, can be used early. Examples: bonus damage, minor heal, apply a light debuff.
- **Ultimate Ability**: High mana cost (typically 5–8). Powerful, game-swinging. Examples: massive damage, AoE bench damage, full heal, powerful status effects.

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
2. The owning player must **immediately swap in a bench unit** (this forced swap is **free** and does NOT cause swap sickness)
3. If no bench units remain, that player **loses the game**

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
- Effects are tied to the **unit**, not the active slot. If a poisoned unit swaps to the bench, it remains poisoned. Poison ticks when that unit's owner's turn starts, regardless of whether the unit is active.
- Shield only absorbs damage to the unit it's on. It does not protect bench units.
- Boost and Slow only apply while the unit is active (bench units with Boost don't benefit until swapped in).
- Status effects can be removed by specific item cards (e.g. "Antidote" removes Poison).

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
- All costs are paid from the same mana pool (abilities, items, swapping)

---

## Item Cards

Item cards are played from hand during the Main Phase. They cost mana, resolve immediately, and are then discarded.

### Item Types

| Type | Effect |
|---|---|
| **Healing** | Restore HP to your active unit (or sometimes a bench unit, if specified) |
| **Damage** | Deal damage directly to the opponent's active unit |
| **Buff** | Apply a positive status effect (Shield, Boost) to your unit |
| **Debuff** | Apply a negative status effect (Poison, Slow) to the opponent's unit |
| **Utility** | Special effects: draw extra cards, force swaps, reduce costs, etc. |

### Card Limits
- Max **2 copies** of any single item card in a deck
- Deck size is exactly **15 cards**
- No maximum hand size

---

## Swap Sickness

When a player **voluntarily swaps** their active unit (spending 1 mana), the newly swapped-in unit suffers **swap sickness**:
- It **cannot attack** this turn
- It **cannot use abilities** this turn
- The player **can** still play item cards on that unit

Swap sickness does **NOT** apply when:
- A unit is **forced to swap in** after a KO (free swap)
- A card effect causes a swap (card text overrides default rules)

---

## Special Rules

### Empty Deck
When your item deck runs out, you simply stop drawing. There is no fatigue/overdraw penalty. Manage your 15 cards wisely.

### Ties
If both players' last units are KO'd simultaneously (e.g. Poison ticks on both), the **player whose turn it is loses** (the defending player wins). This is an edge case.

### Card Text Overrides Rules
If an item card or ability explicitly contradicts a general rule (e.g. "Swap for free" or "This ability can be used twice"), the **card text takes priority**.

---

## Glossary

| Term | Definition |
|---|---|
| **Active Unit** | The worker currently in your active slot, able to fight |
| **Bench** | The reserve area holding your other 2 (or 1) workers |
| **KO** | Knocked Out — when a unit reaches 0 HP |
| **Mana** | Resource spent to use abilities, play items, and swap units |
| **Swap Sickness** | Restriction preventing a voluntarily swapped-in unit from attacking/using abilities that turn |
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
│     🔄  Swap Unit (1 mana, 1/turn)      │
│  4. END:    Effects tick, pass turn      │
│                                         │
│  WIN: KO all 3 opponent workers         │
└─────────────────────────────────────────┘
```