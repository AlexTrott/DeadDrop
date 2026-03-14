// ===== Company & Enums =====

export type Company = 'DELIVEROO' | 'UBER' | 'AMAZON' | 'JUST_EAT'

export type StatusEffectType = 'POISON' | 'SHIELD' | 'BOOST' | 'SLOW'

export type ItemType = 'HEALING' | 'DAMAGE' | 'BUFF' | 'DEBUFF' | 'UTILITY'

export type PlayerId = 'player1' | 'player2'

// ===== Status Effects =====

export interface StatusEffect {
  type: StatusEffectType
  /** Damage per tick (Poison), absorption remaining (Shield), attack bonus (Boost), always 1 for Slow */
  potency: number
  /** null = infinite (Poison, Shield), number = turns remaining (Boost, Slow) */
  duration: number | null
}

// ===== Card Data (Static Definitions) =====

export interface Ability {
  name: string
  manaCost: number
  damage?: number
  effect?: {
    type: StatusEffectType
    potency: number
    duration: number | null
    target: 'self' | 'opponent'
  }
  /** For abilities that heal */
  heal?: {
    amount: number
    target: 'self' | 'all_allies'
  }
  /** For abilities that draw cards */
  draw?: number
  description: string
}

export type WorkerTier = 1 | 2 | 3

export interface GigWorker {
  id: string
  name: string
  company: Company
  emoji: string
  tier: WorkerTier
  hp: number
  attack: number
  abilities: [Ability, Ability] // [basic, ultimate]
  flavourText: string
}

export type CardEffectType =
  | { kind: 'heal'; amount: number; target: 'active' | 'all_allies' }
  | { kind: 'damage'; amount: number; target: 'opponent_active' | 'opponent_all' }
  | { kind: 'damage_conditional'; amount: number; bonusAmount: number; condition: 'target_has_boost'; target: 'opponent_active' }
  | { kind: 'damage_aoe'; activeDamage: number }
  | { kind: 'buff'; statusEffect: { type: StatusEffectType; potency: number; duration: number | null } }
  | { kind: 'debuff'; statusEffect: { type: StatusEffectType; potency: number; duration: number | null } }
  | { kind: 'heal_and_cleanse'; healAmount: number; cleanse: 'negative' | 'all' }
  | { kind: 'draw'; amount: number }
  | { kind: 'draw_and_buff'; drawAmount: number; statusEffect: { type: StatusEffectType; potency: number; duration: number | null } }
  | { kind: 'cleanse'; cleanse: 'negative' | 'all' }
  | { kind: 'multi'; effects: CardEffectType[] }

export interface ItemCard {
  id: string
  name: string
  emoji: string
  manaCost: number
  type: ItemType
  company?: Company
  effect: CardEffectType
  description: string
  flavourText: string
}

// ===== Game State =====

export type GamePhase =
  | 'TEAM_SELECT'
  | 'DECK_BUILD'
  | 'GAME_START'
  | 'START_OF_TURN'
  | 'DRAW_PHASE'
  | 'MAIN_PHASE'
  | 'END_OF_TURN'
  | 'GAME_OVER'

export interface UnitState {
  workerId: string
  currentHp: number
  maxHp: number
  isKnockedOut: boolean
  statusEffects: StatusEffect[]
}

export interface PlayerState {
  id: PlayerId
  workers: [UnitState, UnitState, UnitState]
  activeUnitIndex: number
  deck: string[]
  hand: string[]
  discardPile: string[]
  maxMana: number
  currentMana: number
  hasAttacked: boolean
  hasUsedBasicAbility: boolean
  hasUsedUltimateAbility: boolean
  isFirstTurn: boolean
}

export interface GameState {
  phase: GamePhase
  turnNumber: number
  activePlayerId: PlayerId
  firstPlayerId: PlayerId
  winner: PlayerId | null
  winReason: string | null
  players: Record<PlayerId, PlayerState>
  rngSeed: number
  rngCounter: number
  actionHistory: GameAction[]
  /** Log of combat events for UI display */
  combatLog: CombatLogEntry[]
}

export interface CombatLogEntry {
  turn: number
  playerId: PlayerId
  message: string
}

// ===== Actions =====

export type GameAction =
  | { type: 'SELECT_WORKERS'; playerId: PlayerId; workerIds: [string, string, string] }
  | { type: 'BUILD_DECK'; playerId: PlayerId; cardIds: string[] }
  | { type: 'ATTACK' }
  | { type: 'USE_ABILITY'; abilityIndex: 0 | 1 }
  | { type: 'PLAY_CARD'; cardId: string; target?: string }
  | { type: 'RETREAT' }
  | { type: 'END_TURN' }

// ===== Player View (hides opponent info) =====

export interface PlayerViewState {
  phase: GamePhase
  turnNumber: number
  activePlayerId: PlayerId
  winner: PlayerId | null
  winReason: string | null
  myState: PlayerState
  opponentState: {
    id: PlayerId
    workers: [UnitState, UnitState, UnitState]
    activeUnitIndex: number
    handSize: number
    deckSize: number
    discardPile: string[]
    maxMana: number
    currentMana: number
  }
  combatLog: CombatLogEntry[]
}
