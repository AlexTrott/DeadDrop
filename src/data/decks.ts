import type { Company } from '../types/index.ts'

/**
 * Preset deck configurations per company playstyle.
 * Each deck uses only its own company cards + neutral cards.
 * AI uses these. Max 2 copies of any single card, exactly 20 total.
 */
export const PRESET_DECKS: Record<Company, string[]> = {
  // Deliveroo: All-in aggro — damage, poison, tempo
  DELIVEROO: [
    'hot-bag-toss', 'hot-bag-toss',
    'road-rage', 'road-rage',
    'bike-chain-whip',
    'flat-tyre',
    'red-light-runner', 'red-light-runner',
    'energy-gel',
    'aero-tuck',
    'no-helmet',
    'surge-zone',               // new — 4 mana, 10 dmg
    'adrenaline-shot',          // new — 3 mana, Boost +3
    'chain-delivery',           // new — 5 mana, 8 dmg + draw 1
    'wipeout',                  // new — 6 mana, 14 dmg finisher
    'turbo-mode',               // new — 2 mana, Boost +2
    'pothole',                  // neutral
    'parking-ticket',           // neutral
    'wrong-address',            // neutral
    'protein-bar',              // neutral
  ],

  // Uber: Shields, slow, grind them down
  UBER: [
    'dashcam-footage', 'dashcam-footage',
    'tinted-windows', 'tinted-windows',
    'reinforced-bumper',
    'surge-pricing',
    'cancellation-fee', 'cancellation-fee',
    'child-lock',
    'bottled-water', 'bottled-water',
    'leather-seats',
    'gps-reroute',               // reworked — 3 mana, 4 dmg + slow
    'five-star-armour',         // new — 5 mana, Shield 15 + cleanse
    'premium-protection',       // new — 4 mana, Shield 12
    'fare-surge',               // new — 3 mana, 8 dmg
    'rideshare-riot',           // new — 5 mana, 11 dmg
    'smoke-break',              // neutral
    'high-vis-vest',            // neutral
    'rush-hour',                // neutral
  ],

  // Amazon: Card draw, versatile answers
  AMAZON: [
    'tip-jar', 'tip-jar',
    'prime-delivery', 'prime-delivery',
    'box-cutter', 'box-cutter',
    'wrong-parcel',
    'bus-lane-fine',
    'bubble-wrap', 'bubble-wrap',
    'returns-label',
    'swap-route',              // reworked — 0 mana, draw 1 + boost
    'next-day-delivery',        // new — 4 mana, draw 3
    'warehouse-blitz',          // new — 5 mana, 12 dmg
    'prime-membership',         // new — 3 mana, Shield 8 + draw 1
    'drone-strike',             // new — 6 mana, 15 dmg
    'shortcut',                 // neutral
    'pothole',                  // neutral
    'app-crash',                // neutral
  ],

  // Just Eat: Sustain, heal, outlast
  JUST_EAT: [
    'energy-drink', 'energy-drink',
    'meal-deal', 'meal-deal',
    'five-star-rating', 'five-star-rating',
    'power-nap',
    'antidote-smoothie',
    'extra-portion', 'extra-portion',
    'comfort-food',
    'customer-complaint',
    'feast-mode',               // new — 5 mana, heal 15 + Boost +2
    'food-coma',                // new — 3 mana, Slow 3 turns
    'kitchen-fire',             // new — 4 mana, 9 dmg + Poison 2
    'gourmet-plating',          // new — 4 mana, Shield 10 + Boost +2
    'michelin-star',            // new — 6 mana, heal 20
    'smoke-break',              // neutral
    'phone-charger',            // neutral
    'protein-bar',              // neutral
  ],
}
