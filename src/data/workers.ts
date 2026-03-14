import type { GigWorker } from '../types/index.ts'

export const ALL_WORKERS: GigWorker[] = [
  // ==========================================================
  // DELIVEROO (Teal #00CCBC) — Speed/Aggro/Poison
  // ==========================================================

  // --- Tier 1 (4 units) ---
  {
    id: 'deliveroo-cyclist',
    name: 'Deliveroo Cyclist',
    company: 'DELIVEROO',
    emoji: '🚴',
    tier: 1,
    hp: 16,
    attack: 3,
    abilities: [
      { name: 'Hot Bag Slam', manaCost: 1, damage: 4, description: 'Swings the insulated bag. 4 damage.' },
      { name: 'Toxic Takeaway', manaCost: 4, damage: 8, effect: { type: 'POISON', potency: 2, duration: null, target: 'opponent' }, description: '8 damage + Poison (2/tick).' },
    ],
    flavourText: 'Rain or shine, your pad thai arrives on time.',
  },
  {
    id: 'deliveroo-moped',
    name: 'Deliveroo Moped Rider',
    company: 'DELIVEROO',
    emoji: '🛵',
    tier: 1,
    hp: 18,
    attack: 3,
    abilities: [
      { name: 'Drive-By Delivery', manaCost: 1, damage: 5, description: 'Chucks the parcel without stopping. 5 damage.' },
      { name: 'Rush Hour Rampage', manaCost: 4, damage: 9, effect: { type: 'POISON', potency: 2, duration: null, target: 'opponent' }, description: '9 damage + Poison (2/tick). No stopping this moped.' },
    ],
    flavourText: 'Pavements are just narrow roads if you believe hard enough.',
  },
  {
    id: 'deliveroo-walker',
    name: 'Deliveroo Walker',
    company: 'DELIVEROO',
    emoji: '🚶',
    tier: 1,
    hp: 14,
    attack: 4,
    abilities: [
      { name: 'Ankle Biter', manaCost: 1, damage: 3, effect: { type: 'POISON', potency: 1, duration: null, target: 'opponent' }, description: '3 damage + Poison (1/tick).' },
      { name: 'Marathon Sprint', manaCost: 3, damage: 10, description: '10 damage. Pure burst.' },
    ],
    flavourText: 'No bike. No scooter. Just vibes and a backpack.',
  },
  {
    id: 'deliveroo-night-rider',
    name: 'Deliveroo Night Rider',
    company: 'DELIVEROO',
    emoji: '🌙',
    tier: 1,
    hp: 15,
    attack: 3,
    abilities: [
      { name: 'Stealth Drop', manaCost: 1, damage: 3, effect: { type: 'POISON', potency: 2, duration: null, target: 'opponent' }, description: '3 damage + Poison (2/tick).' },
      { name: 'Midnight Rush', manaCost: 4, damage: 7, effect: { type: 'SLOW', potency: 1, duration: 2, target: 'opponent' }, description: '7 damage + Slow (2 turns).' },
    ],
    flavourText: 'Double rates after 10pm. Double danger too.',
  },

  // --- Tier 2 (3 units) ---
  {
    id: 'deliveroo-ebiker',
    name: 'Deliveroo E-Biker',
    company: 'DELIVEROO',
    emoji: '⚡',
    tier: 2,
    hp: 24,
    attack: 6,
    abilities: [
      { name: 'Turbo Boost', manaCost: 2, damage: 8, description: 'Electric burst. 8 damage.' },
      { name: 'Battery Overload', manaCost: 6, damage: 14, description: 'All-out blast. 14 damage. Glass cannon.' },
    ],
    flavourText: 'The battery says 5%. The rider says full send.',
  },
  {
    id: 'deliveroo-tandem',
    name: 'Deliveroo Tandem',
    company: 'DELIVEROO',
    emoji: '🚲',
    tier: 2,
    hp: 26,
    attack: 5,
    abilities: [
      { name: 'Tag Team', manaCost: 2, damage: 7, description: 'Two riders, one bike. 7 damage.' },
      { name: 'Double Drop', manaCost: 5, damage: 13, description: 'Both riders strike at once. 13 damage.' },
    ],
    flavourText: 'Two riders. One goal. Twice the chaos.',
  },
  {
    id: 'deliveroo-rollerblader',
    name: 'Deliveroo Rollerblader',
    company: 'DELIVEROO',
    emoji: '⛸️',
    tier: 2,
    hp: 25,
    attack: 5,
    abilities: [
      { name: 'Slick Slide', manaCost: 2, damage: 6, effect: { type: 'POISON', potency: 2, duration: null, target: 'opponent' }, description: '6 damage + Poison (2/tick).' },
      { name: 'Spin Attack', manaCost: 6, damage: 11, effect: { type: 'BOOST', potency: 2, duration: 2, target: 'self' }, description: '11 damage + Boost (+2, 2 turns).' },
    ],
    flavourText: 'Retro vibes. Modern violence.',
  },

  // --- Tier 3 (3 units) ---
  {
    id: 'deliveroo-cargo-bike',
    name: 'Deliveroo Cargo Bike',
    company: 'DELIVEROO',
    emoji: '📦',
    tier: 3,
    hp: 40,
    attack: 7,
    abilities: [
      { name: 'Heavy Load', manaCost: 3, damage: 10, description: 'Swings the loaded cargo box. 10 damage.' },
      { name: 'Full Trailer', manaCost: 8, damage: 16, effect: { type: 'POISON', potency: 3, duration: null, target: 'opponent' }, description: '16 damage + Poison (3/tick). Crushing weight.' },
    ],
    flavourText: 'Slow. Heavy. Absolutely devastating.',
  },
  {
    id: 'deliveroo-racer',
    name: 'Deliveroo Racer',
    company: 'DELIVEROO',
    emoji: '🏎️',
    tier: 3,
    hp: 38,
    attack: 8,
    abilities: [
      { name: 'Blitz Delivery', manaCost: 3, damage: 9, description: 'Speed kills. 9 damage.' },
      { name: 'Red Mist', manaCost: 7, damage: 18, effect: { type: 'BOOST', potency: 3, duration: 2, target: 'self' }, description: '18 damage + Boost (+3, 2 turns). Unstoppable.' },
    ],
    flavourText: 'Fastest delivery time in the borough. Or else.',
  },
  {
    id: 'deliveroo-drone',
    name: 'Deliveroo Drone',
    company: 'DELIVEROO',
    emoji: '🤖',
    tier: 3,
    hp: 42,
    attack: 6,
    abilities: [
      { name: 'Air Strike', manaCost: 4, damage: 12, description: 'Drops payload from above. 12 damage.' },
      { name: 'Swarm Protocol', manaCost: 8, damage: 17, effect: { type: 'POISON', potency: 4, duration: null, target: 'opponent' }, description: '17 damage + Poison (4/tick). Relentless machines.' },
    ],
    flavourText: 'No human. No mercy. Beep boop deliver.',
  },

  // ==========================================================
  // UBER (Black #000000) — Control/Tank/Shields/Slow
  // ==========================================================

  // --- Tier 1 (4 units) ---
  {
    id: 'uber-driver',
    name: 'Uber Driver',
    company: 'UBER',
    emoji: '🚗',
    tier: 1,
    hp: 20,
    attack: 2,
    abilities: [
      { name: 'Dashcam Evidence', manaCost: 1, damage: 3, effect: { type: 'SLOW', potency: 1, duration: 1, target: 'opponent' }, description: '3 damage + Slow (1 turn).' },
      { name: 'Armoured Sedan', manaCost: 4, effect: { type: 'SHIELD', potency: 6, duration: null, target: 'self' }, description: 'Shield (6). Locks doors, rolls windows.' },
    ],
    flavourText: '4.3 stars. Doesn\'t talk. Drives like he\'s in a chase scene.',
  },
  {
    id: 'uber-eats-runner',
    name: 'Uber Eats Runner',
    company: 'UBER',
    emoji: '🏃',
    tier: 1,
    hp: 18,
    attack: 3,
    abilities: [
      { name: 'Wrong Turn', manaCost: 1, damage: 4, description: 'A detour that ends with a hit. 4 damage.' },
      { name: 'Cancellation Fee', manaCost: 3, damage: 7, effect: { type: 'SLOW', potency: 1, duration: 2, target: 'opponent' }, description: '7 damage + Slow (2 turns).' },
    ],
    flavourText: 'The app said 200 metres. It lied.',
  },
  {
    id: 'uber-pool',
    name: 'Uber Pool',
    company: 'UBER',
    emoji: '🚐',
    tier: 1,
    hp: 19,
    attack: 2,
    abilities: [
      { name: 'Awkward Carpool', manaCost: 1, damage: 3, effect: { type: 'SLOW', potency: 1, duration: 1, target: 'opponent' }, description: '3 damage + Slow (1 turn).' },
      { name: 'Wrong Passenger', manaCost: 3, damage: 6, effect: { type: 'SLOW', potency: 1, duration: 2, target: 'opponent' }, description: '6 damage + Slow (2 turns). Total confusion.' },
    ],
    flavourText: 'Three strangers, one car, nobody\'s happy.',
  },
  {
    id: 'uber-scooter',
    name: 'Uber Scooter',
    company: 'UBER',
    emoji: '🛴',
    tier: 1,
    hp: 17,
    attack: 3,
    abilities: [
      { name: 'Scooter Swipe', manaCost: 1, damage: 5, description: 'Quick swipe. 5 damage.' },
      { name: 'Abandoned Scooter', manaCost: 4, damage: 8, effect: { type: 'SHIELD', potency: 4, duration: null, target: 'self' }, description: '8 damage + Shield (4). Offensive tank.' },
    ],
    flavourText: 'Left in the middle of the pavement. Naturally.',
  },

  // --- Tier 2 (3 units) ---
  {
    id: 'uber-premium',
    name: 'Uber Premium',
    company: 'UBER',
    emoji: '🎩',
    tier: 2,
    hp: 30,
    attack: 4,
    abilities: [
      { name: 'Complimentary Shield', manaCost: 2, effect: { type: 'SHIELD', potency: 10, duration: null, target: 'self' }, description: 'Shield (10). First class protection.' },
      { name: 'Executive Override', manaCost: 6, damage: 10, effect: { type: 'SHIELD', potency: 8, duration: null, target: 'self' }, description: '10 damage + Shield (8).' },
    ],
    flavourText: 'Offers you water before ruining your day.',
  },
  {
    id: 'uber-xl',
    name: 'Uber XL',
    company: 'UBER',
    emoji: '🚙',
    tier: 2,
    hp: 32,
    attack: 4,
    abilities: [
      { name: 'Road Block', manaCost: 2, damage: 6, effect: { type: 'SLOW', potency: 1, duration: 2, target: 'opponent' }, description: '6 damage + Slow (2 turns). Blocks the road.' },
      { name: 'Six-Seater Slam', manaCost: 5, damage: 12, description: '12 damage. The whole SUV.' },
    ],
    flavourText: 'It\'s not a taxi. It\'s a tank with leather seats.',
  },
  {
    id: 'uber-tuktuk',
    name: 'Uber Tuk-Tuk',
    company: 'UBER',
    emoji: '🛺',
    tier: 2,
    hp: 28,
    attack: 5,
    abilities: [
      { name: 'Honk Barrage', manaCost: 3, damage: 7, description: 'Relentless honking. 7 damage.' },
      { name: 'Three-Wheeler Drift', manaCost: 6, damage: 11, effect: { type: 'SLOW', potency: 1, duration: 2, target: 'opponent' }, description: '11 damage + Slow (2 turns).' },
    ],
    flavourText: 'It has three wheels and zero regard for safety.',
  },

  // --- Tier 3 (3 units) ---
  {
    id: 'uber-black',
    name: 'Uber Black',
    company: 'UBER',
    emoji: '🖤',
    tier: 3,
    hp: 48,
    attack: 6,
    abilities: [
      { name: 'Silent Treatment', manaCost: 3, damage: 9, effect: { type: 'SLOW', potency: 1, duration: 2, target: 'opponent' }, description: '9 damage + Slow (2 turns).' },
      { name: 'VIP Lockdown', manaCost: 8, effect: { type: 'SHIELD', potency: 18, duration: null, target: 'self' }, description: 'Shield (18). Maximum security.' },
    ],
    flavourText: 'Black car. Black windows. Black heart.',
  },
  {
    id: 'uber-boat',
    name: 'Uber Boat',
    company: 'UBER',
    emoji: '🚤',
    tier: 3,
    hp: 44,
    attack: 7,
    abilities: [
      { name: 'Wake Splash', manaCost: 4, damage: 10, effect: { type: 'SLOW', potency: 1, duration: 2, target: 'opponent' }, description: '10 damage + Slow (2 turns).' },
      { name: 'Tidal Wave', manaCost: 7, damage: 18, effect: { type: 'SLOW', potency: 1, duration: 3, target: 'opponent' }, description: '18 damage + Slow (3 turns). Washes everything away.' },
    ],
    flavourText: 'Yes, Uber Boat is real. No, you can\'t dock here.',
  },
  {
    id: 'uber-helicopter',
    name: 'Uber Copter',
    company: 'UBER',
    emoji: '🚁',
    tier: 3,
    hp: 40,
    attack: 7,
    abilities: [
      { name: 'Rotor Slash', manaCost: 3, damage: 11, description: '11 damage. Blades of fury.' },
      { name: 'Air Superiority', manaCost: 9, damage: 20, effect: { type: 'SHIELD', potency: 14, duration: null, target: 'self' }, description: '20 damage + Shield (14). The ultimate Uber.' },
    ],
    flavourText: 'For when a black car isn\'t extra enough.',
  },

  // ==========================================================
  // AMAZON (Orange #FF9900) — Swarm/Utility/Card Draw
  // ==========================================================

  // --- Tier 1 (4 units) ---
  {
    id: 'amazon-courier',
    name: 'Amazon Courier',
    company: 'AMAZON',
    emoji: '📦',
    tier: 1,
    hp: 16,
    attack: 3,
    abilities: [
      { name: 'Priority Delivery', manaCost: 1, damage: 3, draw: 1, description: '3 damage + Draw 1 card.' },
      { name: 'Same-Day Blitz', manaCost: 4, damage: 8, draw: 1, description: '8 damage + Draw 1.' },
    ],
    flavourText: 'Left it behind the bins. In the rain.',
  },
  {
    id: 'amazon-van',
    name: 'Amazon Van Driver',
    company: 'AMAZON',
    emoji: '🚐',
    tier: 1,
    hp: 20,
    attack: 2,
    abilities: [
      { name: 'Bumper Bash', manaCost: 1, damage: 4, description: 'The van is a weapon. 4 damage.' },
      { name: 'Warehouse Recall', manaCost: 3, heal: { amount: 8, target: 'all_allies' }, description: 'Heal all allies 8 HP. Back to base.' },
    ],
    flavourText: '47 stops left. 3 hours remaining. Bring it on.',
  },
  {
    id: 'amazon-flex',
    name: 'Amazon Flex Runner',
    company: 'AMAZON',
    emoji: '🏃‍♂️',
    tier: 1,
    hp: 15,
    attack: 4,
    abilities: [
      { name: 'Returns Processing', manaCost: 1, damage: 5, description: '5 damage. Sent back hard.' },
      { name: 'Prime Day Surge', manaCost: 3, damage: 6, effect: { type: 'BOOST', potency: 2, duration: 2, target: 'self' }, description: '6 damage + Boost (+2, 2 turns).' },
    ],
    flavourText: 'Technically self-employed. Technically terrifying.',
  },
  {
    id: 'amazon-warehouse',
    name: 'Amazon Warehouse Worker',
    company: 'AMAZON',
    emoji: '🏭',
    tier: 1,
    hp: 18,
    attack: 3,
    abilities: [
      { name: 'Conveyor Belt', manaCost: 1, draw: 1, damage: 3, description: '3 damage + Draw 1.' },
      { name: 'Fulfilment Frenzy', manaCost: 4, damage: 7, draw: 2, description: '7 damage + Draw 2. Maximum throughput.' },
    ],
    flavourText: 'Picks 300 items per hour. Including fights.',
  },

  // --- Tier 2 (3 units) ---
  {
    id: 'amazon-locker',
    name: 'Amazon Locker',
    company: 'AMAZON',
    emoji: '🔐',
    tier: 2,
    hp: 30,
    attack: 4,
    abilities: [
      { name: 'Secure Storage', manaCost: 2, effect: { type: 'SHIELD', potency: 8, duration: null, target: 'self' }, draw: 1, description: 'Shield (8) + Draw 1.' },
      { name: 'Locker Overflow', manaCost: 5, damage: 12, draw: 1, description: '12 damage + Draw 1. Everything falls out.' },
    ],
    flavourText: 'The code is 7493. The locker is jammed. Good luck.',
  },
  {
    id: 'amazon-drone-delivery',
    name: 'Amazon Drone',
    company: 'AMAZON',
    emoji: '🛸',
    tier: 2,
    hp: 26,
    attack: 5,
    abilities: [
      { name: 'Aerial Drop', manaCost: 2, damage: 7, description: '7 damage from above.' },
      { name: 'Precision Strike', manaCost: 6, damage: 14, description: '14 damage. Surgical accuracy.' },
    ],
    flavourText: 'The future of delivery. The end of privacy.',
  },
  {
    id: 'amazon-returns',
    name: 'Amazon Returns Handler',
    company: 'AMAZON',
    emoji: '🔄',
    tier: 2,
    hp: 28,
    attack: 4,
    abilities: [
      { name: 'Send It Back', manaCost: 3, damage: 8, effect: { type: 'POISON', potency: 2, duration: null, target: 'opponent' }, description: '8 damage + Poison (2/tick).' },
      { name: 'Full Refund', manaCost: 5, heal: { amount: 12, target: 'self' }, draw: 1, description: 'Heal 12 HP + Draw 1. Money back guarantee.' },
    ],
    flavourText: '\'Reason for return: It tried to fight me.\'',
  },

  // --- Tier 3 (3 units) ---
  {
    id: 'amazon-robot',
    name: 'Amazon Warehouse Robot',
    company: 'AMAZON',
    emoji: '🤖',
    tier: 3,
    hp: 42,
    attack: 6,
    abilities: [
      { name: 'Shelf Retrieval', manaCost: 3, damage: 8, draw: 1, description: '8 damage + Draw 1. Efficient.' },
      { name: 'Assembly Line', manaCost: 7, damage: 15, effect: { type: 'BOOST', potency: 3, duration: 3, target: 'self' }, description: '15 damage + Boost (+3, 3 turns). Automated fury.' },
    ],
    flavourText: 'Does not tire. Does not complain. Does not miss.',
  },
  {
    id: 'amazon-prime-van',
    name: 'Amazon Prime Van',
    company: 'AMAZON',
    emoji: '🚛',
    tier: 3,
    hp: 46,
    attack: 6,
    abilities: [
      { name: 'Double Parked', manaCost: 4, damage: 10, effect: { type: 'SLOW', potency: 1, duration: 2, target: 'opponent' }, description: '10 damage + Slow (2 turns).' },
      { name: 'Route Optimiser', manaCost: 7, heal: { amount: 14, target: 'all_allies' }, draw: 1, description: 'Heal all allies 14 HP + Draw 1.' },
    ],
    flavourText: 'Blocking your driveway since 2015.',
  },
  {
    id: 'amazon-alexa',
    name: 'Amazon Alexa',
    company: 'AMAZON',
    emoji: '🔊',
    tier: 3,
    hp: 38,
    attack: 7,
    abilities: [
      { name: 'Voice Command', manaCost: 3, damage: 9, draw: 1, description: '9 damage + Draw 1.' },
      { name: 'Smart Home Siege', manaCost: 8, damage: 18, draw: 2, description: '18 damage + Draw 2. Alexa, destroy them.' },
    ],
    flavourText: '\'Alexa, end this man\'s whole career.\' \'OK.\'',
  },

  // ==========================================================
  // JUST EAT (Red #E63329) — Sustain/Buff/Heal
  // ==========================================================

  // --- Tier 1 (4 units) ---
  {
    id: 'justeat-cyclist',
    name: 'Just Eat Cyclist',
    company: 'JUST_EAT',
    emoji: '🚴‍♂️',
    tier: 1,
    hp: 19,
    attack: 2,
    abilities: [
      { name: 'Meal Prep', manaCost: 1, heal: { amount: 5, target: 'self' }, description: 'Heal self 5 HP.' },
      { name: 'Five-Course Feast', manaCost: 4, heal: { amount: 10, target: 'self' }, effect: { type: 'BOOST', potency: 2, duration: 2, target: 'self' }, description: 'Heal 10 HP + Boost (+2, 2 turns).' },
    ],
    flavourText: 'Pedals harder when the rating drops below 4 stars.',
  },
  {
    id: 'justeat-scooter',
    name: 'Just Eat Scooter',
    company: 'JUST_EAT',
    emoji: '🛴',
    tier: 1,
    hp: 17,
    attack: 3,
    abilities: [
      { name: 'Hot Sauce Splash', manaCost: 1, damage: 4, effect: { type: 'BOOST', potency: 1, duration: 2, target: 'self' }, description: '4 damage + Boost (+1, 2 turns).' },
      { name: 'Full English Fortify', manaCost: 3, effect: { type: 'SHIELD', potency: 6, duration: null, target: 'self' }, description: 'Shield (6). Fortified by a proper fry-up.' },
    ],
    flavourText: 'Electric. Silent. Absolutely lethal on the pavement.',
  },
  {
    id: 'justeat-moped',
    name: 'Just Eat Moped',
    company: 'JUST_EAT',
    emoji: '🍕',
    tier: 1,
    hp: 18,
    attack: 3,
    abilities: [
      { name: 'Comfort Food', manaCost: 1, heal: { amount: 6, target: 'all_allies' }, description: 'Heal all allies 6 HP.' },
      { name: 'Kitchen Nightmare', manaCost: 4, damage: 9, effect: { type: 'POISON', potency: 1, duration: null, target: 'opponent' }, description: '9 damage + Poison (1/tick).' },
    ],
    flavourText: 'The pizza box isn\'t just for show. Well, sometimes it is.',
  },
  {
    id: 'justeat-burger-flipper',
    name: 'Just Eat Burger Flipper',
    company: 'JUST_EAT',
    emoji: '🍔',
    tier: 1,
    hp: 16,
    attack: 4,
    abilities: [
      { name: 'Grease Splash', manaCost: 1, damage: 5, description: '5 damage. Hot oil hurts.' },
      { name: 'Triple Stack', manaCost: 3, damage: 7, heal: { amount: 4, target: 'self' }, description: '7 damage + Heal 4 HP. A balanced meal.' },
    ],
    flavourText: 'Flips burgers. Also flips tables.',
  },

  // --- Tier 2 (3 units) ---
  {
    id: 'justeat-sushi-chef',
    name: 'Just Eat Sushi Chef',
    company: 'JUST_EAT',
    emoji: '🍣',
    tier: 2,
    hp: 28,
    attack: 5,
    abilities: [
      { name: 'Knife Skills', manaCost: 2, damage: 7, description: '7 damage. Precise cuts.' },
      { name: 'Omakase', manaCost: 6, heal: { amount: 10, target: 'self' }, effect: { type: 'BOOST', potency: 3, duration: 2, target: 'self' }, description: 'Heal 10 + Boost (+3, 2 turns). Chef\'s choice.' },
    ],
    flavourText: 'Trained in Tokyo. Delivers in Tooting.',
  },
  {
    id: 'justeat-smoothie-barista',
    name: 'Just Eat Smoothie Barista',
    company: 'JUST_EAT',
    emoji: '🥤',
    tier: 2,
    hp: 26,
    attack: 4,
    abilities: [
      { name: 'Green Juice', manaCost: 2, heal: { amount: 8, target: 'self' }, description: 'Heal 8 HP. Detox.' },
      { name: 'Superfood Blend', manaCost: 5, heal: { amount: 10, target: 'all_allies' }, description: 'Heal ALL allies 10 HP. Total cleanse.' },
    ],
    flavourText: 'Kale, ginger, spirulina, and an attitude.',
  },
  {
    id: 'justeat-kebab-master',
    name: 'Just Eat Kebab Master',
    company: 'JUST_EAT',
    emoji: '🥙',
    tier: 2,
    hp: 30,
    attack: 5,
    abilities: [
      { name: 'Skewer Strike', manaCost: 3, damage: 9, description: '9 damage. On a stick.' },
      { name: 'Meat Tornado', manaCost: 6, damage: 12, effect: { type: 'BOOST', potency: 2, duration: 3, target: 'self' }, description: '12 damage + Boost (+2, 3 turns).' },
    ],
    flavourText: '3am. Drunk. Perfect kebab. Every time.',
  },

  // --- Tier 3 (3 units) ---
  {
    id: 'justeat-curry-king',
    name: 'Just Eat Curry King',
    company: 'JUST_EAT',
    emoji: '🍛',
    tier: 3,
    hp: 44,
    attack: 6,
    abilities: [
      { name: 'Spice Blast', manaCost: 3, damage: 8, effect: { type: 'POISON', potency: 3, duration: null, target: 'opponent' }, description: '8 damage + Poison (3/tick).' },
      { name: 'Vindaloo Inferno', manaCost: 7, damage: 16, effect: { type: 'POISON', potency: 4, duration: null, target: 'opponent' }, description: '16 damage + Poison (4/tick). Scorching.' },
    ],
    flavourText: 'How hot? Yes.',
  },
  {
    id: 'justeat-ice-cream-man',
    name: 'Just Eat Ice Cream Man',
    company: 'JUST_EAT',
    emoji: '🍦',
    tier: 3,
    hp: 42,
    attack: 6,
    abilities: [
      { name: 'Brain Freeze', manaCost: 4, damage: 10, effect: { type: 'SLOW', potency: 1, duration: 2, target: 'opponent' }, description: '10 damage + Slow (2 turns).' },
      { name: 'Soft Serve Shield', manaCost: 8, heal: { amount: 14, target: 'self' }, effect: { type: 'SHIELD', potency: 14, duration: null, target: 'self' }, description: 'Heal 14 HP + Shield (14).' },
    ],
    flavourText: 'Plays the jingle. Delivers the pain.',
  },
  {
    id: 'justeat-wok-warrior',
    name: 'Just Eat Wok Warrior',
    company: 'JUST_EAT',
    emoji: '🥘',
    tier: 3,
    hp: 40,
    attack: 7,
    abilities: [
      { name: 'Wok Toss', manaCost: 3, damage: 11, description: '11 damage. Tossed in a wok.' },
      { name: 'Flambé', manaCost: 7, damage: 17, effect: { type: 'BOOST', potency: 4, duration: 2, target: 'self' }, description: '17 damage + Boost (+4, 2 turns). Fire and fury.' },
    ],
    flavourText: 'The wok is cast iron. The will is cast steel.',
  },
]

export const WORKERS_BY_ID: Record<string, GigWorker> = Object.fromEntries(
  ALL_WORKERS.map((w) => [w.id, w])
)

export const WORKERS_BY_COMPANY: Record<string, GigWorker[]> = ALL_WORKERS.reduce(
  (acc, w) => {
    if (!acc[w.company]) acc[w.company] = []
    acc[w.company].push(w)
    return acc
  },
  {} as Record<string, GigWorker[]>
)
