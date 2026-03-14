# Brief: Dead Drop

## Elevator Pitch

**Pick your gig workers, battle like it's Pokémon, with more items than you can count, for a super tactical game.**

Dead Drop is a collectible card game set in the absurd world of gig economy workers. Deliveroo cyclists, Uber drivers, Amazon couriers, and more duke it out in tactical, turn-based battles. Build a team of 3 workers, arm them with a deck of 15 item cards, and outsmart your opponent through clever swapping, ability timing, and resource management.

## Inspiration

- **Pokémon TCG**: 1 active unit with bench swapping, KO-based win condition, type/company identity
- **Hearthstone**: Escalating mana system, item/spell cards played from hand, tight turn structure

## What Makes It Unique

1. **The Theme**: Gig workers as battle units is inherently funny and relatable. The flavour writes itself — "Surge Pricing" as a damage buff, "Customer Complaint" as a debuff, "Five-Star Rating" as a heal
2. **Small Deck, Big Decisions**: With only 15 item cards, every draw matters. No filler. No dead turns
3. **Unit + Item Separation**: Your 3 workers are always available (not drawn from a deck). The deck is pure tactics — items, buffs, tricks. Deck-building is about finding 15 cards that synergise with your team
4. **Mana-Costed Swapping**: Unlike Pokémon where switching is free (with a retreat cost on the unit), swapping costs 1 mana from your shared pool. This creates genuine "do I swap or save mana for my ability?" tension every turn

## Target Experience

A match should last **8–15 minutes**. The first few turns feel like setup — cheap items, basic abilities, feeling out the opponent. Mid-game is where swaps and combos start landing. Late-game (7+ mana) is explosive — ultimates fire, big items drop, and momentum shifts fast.

The game should feel:
- **Accessible**: Simple enough to learn in one match
- **Tactical**: Deep enough that better play wins more often
- **Funny**: The gig worker theme should make you grin
- **Snappy**: No long waits, no complex chains to resolve

## MVP Scope

### In Scope (Build This)
- Single-player vs local AI opponent
- Team selection: pick 3 workers from a roster of ~8–12
- Deck building: choose 15 item cards from a pool of ~20–25 unique items
- Full turn-based combat with mana system
- 4 status effects: Poison, Shield, Boost, Slow
- Basic AI that makes reasonable decisions
- Game over screen with result
- Web-based, runs in browser (React + Vite)

### Out of Scope (Future)
- Online multiplayer (WebSocket/real-time)
- Ranked matchmaking and ladders
- Account system and progression
- Card collection and unlocking
- Real artwork (replacing emoji placeholders)
- Sound effects and music
- Mobile-optimised layout
- Deck sharing and importing
- Campaign/story mode
- Card crafting or economy

## Gig Companies (MVP Roster)

Each company acts as a loose "type" — units from the same company may share thematic abilities but there's no strict type advantage system in MVP.

| Company | Colour | Emoji | Worker Variants |
|---|---|---|---|
| Deliveroo | Teal `#00CCBC` | 🛵 | Cyclist 🚴, Driver 🛵, Walker 🚶 |
| Uber | Black `#000000` | 🚗 | Driver 🚗, Eats Runner 🏃, Premium 🎩 |
| Amazon | Orange `#FF9900` | 📦 | Courier 📦, Van Driver 🚐, Flex Runner 🏃‍♂️ |
| Just Eat | Red `#E63329` | 🍔 | Cyclist 🚴‍♂️, Scooter 🛴 |

Aim for **3 workers per company** for MVP, giving ~12 total to choose from.

## Item Card Categories

| Type | Purpose | Example Cards |
|---|---|---|
| Healing | Restore HP | Energy Drink 🥤, Meal Deal 🥪, Power Nap 😴 |
| Damage | Deal direct damage | Pothole 🕳️, Road Rage 😡, Speed Camera 📸 |
| Buff | Boost your active unit | Five-Star Rating ⭐, Surge Pricing 💰, Shortcut 🗺️ |
| Debuff | Weaken opponent's unit | Customer Complaint 📱, Wrong Address 📍, Flat Tyre 💨 |
| Utility | Special effects | Swap Route 🔄 (free swap), GPS Reroute 🛰️ (force opponent swap), Tip Jar 🫙 (draw extra card) |

## Success Criteria

MVP is successful if:
1. A full game can be played start to finish without errors
2. The AI provides a reasonable challenge (wins ~30–40% against a good player)
3. All 4 status effects work correctly
4. Mana, draw, swap, and KO mechanics all function as per rules
5. The game is fun to play twice in a row

## Technical Constraints

- No backend for MVP — everything runs client-side
- No external image assets — emoji only
- Must be playable in modern browsers (Chrome, Firefox, Safari)
- Architecture must cleanly separate game engine from UI (for future multiplayer extraction)
- TypeScript throughout — no `any` types in game engine