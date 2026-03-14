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
    target: 'self' | 'opponent' | 'all_opponent_bench'
  }
  /** For abilities that heal */
  heal?: {
    amount: number
    target: 'self' | 'all_allies' | 'bench_allies'
  }
  /** For abilities that draw cards */
  draw?: number
  /** For abilities that deal bench damage */
  benchDamage?: number
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
  | { kind: 'damage_aoe'; activeDamage: number; benchDamage: number }
  | { kind: 'buff'; statusEffect: { type: StatusEffectType; potency: number; duration: number | null } }
  | { kind: 'debuff'; statusEffect: { type: StatusEffectType; potency: number; duration: number | null } }
  | { kind: 'heal_and_cleanse'; healAmount: number; cleanse: 'negative' | 'all' }
  | { kind: 'draw'; amount: number }
  | { kind: 'free_swap' }
  | { kind: 'force_opponent_swap' }
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
  | 'STARTING_UNIT_SELECT'
  | 'GAME_START'
  | 'START_OF_TURN'
  | 'DRAW_PHASE'
  | 'MAIN_PHASE'
  | 'FORCED_SWAP'
  | 'END_OF_TURN'
  | 'GAME_OVER'

export interface UnitState {
  workerId: string
  currentHp: number
  maxHp: number
  isKnockedOut: boolean
  statusEffects: StatusEffect[]
  swapSick: boolean
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
  hasSwapped: boolean
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
  /** Which player needs to perform a forced swap (set during FORCED_SWAP phase) */
  awaitingForcedSwap: PlayerId | null
  /** Log of combat events for UI display */
  combatLog: CombatLogEntry[]
  /** Player who needs to pick a bench unit for a free swap (from Swap Route card) */
  pendingFreeSwap: PlayerId | null
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
  | { type: 'SELECT_STARTING_UNIT'; playerId: PlayerId; workerIndex: number }
  | { type: 'ATTACK' }
  | { type: 'USE_ABILITY'; abilityIndex: 0 | 1 }
  | { type: 'PLAY_CARD'; cardId: string; target?: string }
  | { type: 'SWAP_UNIT'; benchIndex: number }
  | { type: 'END_TURN' }
  | { type: 'FORCED_SWAP'; benchIndex: number }

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
