/**
 * AI emotes — Hearthstone-style BM lines, unique per worker.
 * The AI randomly picks from these during combat.
 */

interface EmoteSet {
  /** Said at start of AI turn */
  greeting: string[]
  /** Said when AI attacks */
  attack: string[]
  /** Said when AI uses an ability */
  ability: string[]
  /** Said when AI KOs your unit */
  kill: string[]
  /** Said when AI's unit is low HP */
  lowHp: string[]
  /** Said when AI plays a card */
  card: string[]
  /** Said when AI swaps */
  swap: string[]
}

const DEFAULT_EMOTES: EmoteSet = {
  greeting: ['My turn.', 'Let\'s go.', 'Watch this.'],
  attack: ['Take that!', 'Incoming!'],
  ability: ['How about this?', 'Special delivery!'],
  kill: ['Too easy.', 'Next!', 'Who\'s next?'],
  lowHp: ['I\'m not done yet.', 'Just a scratch.'],
  card: ['I\'ll play this.', 'Here\'s a surprise.'],
  swap: ['Tag out!', 'Fresh legs.'],
}

const WORKER_EMOTES: Record<string, Partial<EmoteSet>> = {
  // === DELIVEROO ===
  'deliveroo-cyclist': {
    greeting: ['Helmet on. Let\'s ride.', 'Your pad thai is... pain.'],
    attack: ['Hot bag to the face!', 'Delivery for you!'],
    ability: ['Pedal to the metal!'],
    kill: ['Order complete. ⭐⭐⭐⭐⭐', 'Delivered. To the shadow realm.'],
    lowHp: ['I can still make the drop...'],
  },
  'deliveroo-moped': {
    greeting: ['*revs engine*', 'Pavement? What pavement?'],
    attack: ['BEEP BEEP!', 'Drive-by!'],
    kill: ['Splattered like a dropped kebab.'],
    lowHp: ['The moped is dented but I\'m fine.'],
  },
  'deliveroo-walker': {
    greeting: ['No bike. No problem.', 'I walked here. Uphill.'],
    attack: ['These legs don\'t skip leg day.'],
    ability: ['Marathon mode activated!'],
    kill: ['Walked all over you.'],
  },
  'deliveroo-ebiker': {
    greeting: ['Battery at 5%. Full send.', 'Electric dreams, electric screams.'],
    attack: ['ZAP!', 'Feel the voltage!'],
    kill: ['Overcharged.'],
    lowHp: ['Battery low... but so is your HP.'],
  },
  'deliveroo-night-rider': {
    greeting: ['Double rates. Double danger.', '*emerges from shadows*'],
    attack: ['You didn\'t see me coming.'],
    kill: ['Vanished. Like your HP.'],
  },
  'deliveroo-tandem': {
    greeting: ['Two riders. One nightmare.'],
    attack: ['Tag team!', 'Double trouble!'],
    kill: ['Twice the riders, twice the pain.'],
  },
  'deliveroo-rollerblader': {
    greeting: ['Retro vibes. Modern violence.'],
    attack: ['Spin attack!', 'Wheeeee!'],
    kill: ['Rolled right through you.'],
  },
  'deliveroo-cargo-bike': {
    greeting: ['Heavy. Slow. Devastating.'],
    attack: ['This box weighs 40kg. Feel it.'],
    kill: ['Delivered in bulk.'],
  },
  'deliveroo-racer': {
    greeting: ['Fastest in the borough.', 'Eat my dust.'],
    attack: ['Blitz!'],
    kill: ['Speed kills. Literally.'],
  },
  'deliveroo-drone': {
    greeting: ['Beep boop. Targeting acquired.', 'No human. No mercy.'],
    attack: ['Payload deployed.', 'Airstrike inbound.'],
    kill: ['Target eliminated. Beep.'],
    lowHp: ['Systems... failing... beep...'],
  },

  // === UBER ===
  'uber-driver': {
    greeting: ['4.3 stars. Get in.', 'The meter\'s running.'],
    attack: ['Dashcam caught that.', 'Road rage!'],
    kill: ['Ride\'s over. One star.'],
    lowHp: ['I\'ve survived worse passengers.'],
  },
  'uber-eats-runner': {
    greeting: ['The app said 200m. It lied.', 'Wrong turn? No. Right turn.'],
    attack: ['Detour through your face!'],
    kill: ['Cancelled. With extreme prejudice.'],
  },
  'uber-premium': {
    greeting: ['Water?', 'Welcome to the premium experience.'],
    attack: ['Premium damage.', 'Complimentary beating.'],
    kill: ['5 stars. For me.'],
    lowHp: ['Even premium has limits...'],
  },
  'uber-xl': {
    greeting: ['I\'m not a taxi. I\'m a TANK.', '*parks in the lane*'],
    attack: ['SIX SEATS OF FURY!'],
    kill: ['Roadblock. Permanent.'],
  },
  'uber-pool': {
    greeting: ['Three strangers. Zero sympathy.', 'Awkward carpool energy.'],
    attack: ['Wrong passenger. Right fist.'],
    kill: ['Everyone out. Now.'],
  },
  'uber-black': {
    greeting: ['Black car. Black heart.', '*rolls down tinted window*'],
    attack: ['Silent. Deadly.'],
    kill: ['VIP access to defeat.'],
    lowHp: ['The windows are tinted so you can\'t see me cry.'],
  },
  'uber-scooter': {
    greeting: ['Left in the middle of the pavement.', '*beep beep beep*'],
    attack: ['Scooter swipe!'],
    kill: ['Abandoned. Like your hopes.'],
  },
  'uber-boat': {
    greeting: ['Yes, Uber Boat is real.', 'No, you can\'t dock here.'],
    attack: ['Wake splash!', 'Tidal wave!'],
    kill: ['Sunk.'],
  },
  'uber-helicopter': {
    greeting: ['For when a black car isn\'t extra enough.', '*rotor noises intensify*'],
    attack: ['Air superiority!', 'Rotor slash!'],
    kill: ['Chopped.'],
    lowHp: ['Mayday! Mayday!'],
  },
  'uber-tuktuk': {
    greeting: ['Three wheels. Zero safety.', 'HONK HONK HONK!'],
    attack: ['Honk barrage!'],
    kill: ['Three-wheeled destruction.'],
  },

  // === AMAZON ===
  'amazon-courier': {
    greeting: ['Left it behind the bins.', 'Priority delivery: PAIN.'],
    attack: ['Same-day delivery!'],
    kill: ['Package delivered. To the afterlife.'],
  },
  'amazon-van': {
    greeting: ['47 stops. 3 hours. Bring it on.'],
    attack: ['Bumper bash!', 'The van is a weapon.'],
    kill: ['You\'re stop #48. Final stop.'],
  },
  'amazon-flex': {
    greeting: ['Technically self-employed. Technically terrifying.'],
    attack: ['Flex on this!'],
    kill: ['Flexed too hard. Sorry.'],
  },
  'amazon-locker': {
    greeting: ['The code is 7493. The locker is jammed.', '*locks menacingly*'],
    attack: ['Locker slam!'],
    kill: ['Permanently locked out.'],
  },
  'amazon-drone-delivery': {
    greeting: ['The future is here. And it\'s angry.'],
    attack: ['Precision strike!', 'Aerial drop!'],
    kill: ['Delivered from above.'],
  },
  'amazon-warehouse': {
    greeting: ['300 picks per hour. Including fights.'],
    attack: ['Conveyor belt to the face!'],
    kill: ['Fulfilled.'],
    lowHp: ['Break time is in 4 hours...'],
  },
  'amazon-returns': {
    greeting: ['Reason for return: it fought me.'],
    attack: ['Sending it back!'],
    kill: ['Full refund. Full damage.'],
  },
  'amazon-robot': {
    greeting: ['Does not tire. Does not complain.', '*whirring intensifies*'],
    attack: ['Shelf retrieval... of your dignity.'],
    kill: ['Efficiently eliminated.'],
  },
  'amazon-prime-van': {
    greeting: ['Blocking your driveway since 2015.'],
    attack: ['Double parked in your face!'],
    kill: ['Route optimised. You\'re eliminated.'],
  },
  'amazon-alexa': {
    greeting: ['"Alexa, destroy them." "OK."', '*listening...*'],
    attack: ['Voice command: ATTACK.'],
    kill: ['"Alexa, play Despacito." They\'re done.'],
  },

  // === JUST EAT ===
  'justeat-cyclist': {
    greeting: ['Rating dropped below 4 stars. Someone dies.'],
    attack: ['Meal prep!'],
    kill: ['Five-star knockout.'],
  },
  'justeat-scooter': {
    greeting: ['Electric. Silent. Lethal.'],
    attack: ['Hot sauce splash!'],
    kill: ['Scooted to oblivion.'],
  },
  'justeat-moped': {
    greeting: ['The pizza box isn\'t just for show.'],
    attack: ['Comfort food? Nah. COMBAT food.'],
    kill: ['Kitchen nightmare. Yours.'],
  },
  'justeat-sushi-chef': {
    greeting: ['Trained in Tokyo. Delivers in Tooting.', 'Omakase.'],
    attack: ['Knife skills!', 'Chef\'s choice: PAIN.'],
    kill: ['Served. Literally.'],
  },
  'justeat-curry-king': {
    greeting: ['How hot? YES.', '*stirs cauldron ominously*'],
    attack: ['Spice blast!', 'Vindaloo incoming!'],
    kill: ['Too hot to handle.'],
    lowHp: ['The spice flows through me...'],
  },
  'justeat-burger-flipper': {
    greeting: ['Flips burgers. Also flips tables.'],
    attack: ['Grease splash!', 'Get flipped!'],
    kill: ['Triple stacked. And done.'],
  },
  'justeat-smoothie-barista': {
    greeting: ['Kale, ginger, and an attitude.', 'Detox time.'],
    attack: ['Green juice to the face!'],
    kill: ['Blended.'],
  },
  'justeat-kebab-master': {
    greeting: ['3am. Perfect kebab. Every time.', '*sharpens sword*'],
    attack: ['Skewer strike!', 'On a stick!'],
    kill: ['Served with extra chilli sauce.'],
  },
  'justeat-ice-cream-man': {
    greeting: ['*plays the jingle*', 'Mr Whippy sends his regards.'],
    attack: ['Brain freeze!'],
    kill: ['Ice cold.'],
    lowHp: ['I\'m... melting...'],
  },
  'justeat-wok-warrior': {
    greeting: ['The wok is cast iron. The will is cast steel.'],
    attack: ['Wok toss!', 'Flambé!'],
    kill: ['Stir-fried to perfection.'],
  },
}

function pick(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)]!
}

function getEmotes(workerId: string): EmoteSet {
  const custom = WORKER_EMOTES[workerId]
  if (!custom) return DEFAULT_EMOTES
  return {
    greeting: custom.greeting ?? DEFAULT_EMOTES.greeting,
    attack: custom.attack ?? DEFAULT_EMOTES.attack,
    ability: custom.ability ?? DEFAULT_EMOTES.ability,
    kill: custom.kill ?? DEFAULT_EMOTES.kill,
    lowHp: custom.lowHp ?? DEFAULT_EMOTES.lowHp,
    card: custom.card ?? DEFAULT_EMOTES.card,
    swap: custom.swap ?? DEFAULT_EMOTES.swap,
  }
}

export function getAIEmote(workerId: string, context: keyof EmoteSet): string {
  const emotes = getEmotes(workerId)
  return pick(emotes[context])
}
