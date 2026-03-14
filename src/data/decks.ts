import type { Company } from '../types/index.ts'

/**
 * Preset deck configurations per company playstyle.
 * Each deck uses only its own company cards + neutral cards.
 * AI uses these. Max 2 copies of any single card, exactly 15 total.
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
    'pothole',               // neutral
    'parking-ticket',        // neutral
    'wrong-address',         // neutral
    'protein-bar',           // neutral
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
    'gps-reroute',
    'smoke-break',           // neutral
    'high-vis-vest',         // neutral
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
    'swap-route',
    'shortcut',              // neutral
    'pothole',               // neutral
    'app-crash',             // neutral
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
    'smoke-break',           // neutral
    'phone-charger',         // neutral
    'protein-bar',           // neutral
  ],
}
