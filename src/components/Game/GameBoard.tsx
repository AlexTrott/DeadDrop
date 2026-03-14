import { useEffect, useRef } from 'react'
import { useGameStore, useAvailableActions } from '../../store/gameStore.ts'
import { getActiveUnit } from '../../engine/GameState.ts'
import { FighterPanel } from '../Battle/Battlefield.tsx'
import { CenterStrip } from './InfoBar.tsx'
import { HandDrawer } from '../Hand/HandDrawer.tsx'
import { ActionBar } from './ActionBar.tsx'
import { ForcedSwapModal } from './ForcedSwapModal.tsx'
import { ToastContainer, useToastStore } from './Toast.tsx'
import type { GameAction } from '../../types/index.ts'

export function GameBoard() {
  const gameState = useGameStore((s) => s.gameState)
  const isAIThinking = useGameStore((s) => s.isAIThinking)
  const dispatch = useGameStore((s) => s.dispatch)
  const availableActions = useAvailableActions()
  const addToast = useToastStore((s) => s.addToast)

  const lastLogLen = useRef(0)
  useEffect(() => {
    if (!gameState) return
    const log = gameState.combatLog
    if (log.length > lastLogLen.current) {
      const newEntries = log.slice(lastLogLen.current)
      for (const entry of newEntries) {
        const type = entry.playerId === 'player1' ? 'player' as const : 'opponent' as const
        addToast(entry.message, type)
      }
      lastLogLen.current = log.length
    }
  }, [gameState?.combatLog.length])

  if (!gameState) return null

  const player = gameState.players.player1!
  const opponent = gameState.players.player2!
  const isPlayerTurn = gameState.activePlayerId === 'player1'
  const playerActive = getActiveUnit(player)
  const opponentActive = getActiveUnit(opponent)

  const canSwap = availableActions.some((a) => a.type === 'SWAP_UNIT')
  const showForcedSwap = gameState.phase === 'FORCED_SWAP' && gameState.awaitingForcedSwap === 'player1'

  const canPlayCard = (cardId: string) =>
    availableActions.some((a) => a.type === 'PLAY_CARD' && a.cardId === cardId)

  const handleAction = (action: GameAction) => {
    if (!isPlayerTurn && action.type !== 'FORCED_SWAP') return
    dispatch(action)
  }

  return (
    <div
      className="h-[100dvh] flex flex-col relative overflow-hidden"
      style={{ background: '#0a0e14' }}
    >
      <ToastContainer />

      {showForcedSwap && (
        <ForcedSwapModal
          player={player}
          onSelect={(benchIndex) => handleAction({ type: 'FORCED_SWAP', benchIndex })}
        />
      )}

      {/* === BATTLEFIELD === */}
      {/* Mobile: vertical stack (opponent art → center strip → player art) */}
      {/* Desktop (lg+): horizontal layout (opponent card | center column | player card) */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row lg:items-stretch lg:gap-0 w-full lg:max-w-6xl lg:mx-auto">
        {/* Opponent panel */}
        <div className="flex-1 min-h-0 lg:order-1">
          <FighterPanel unit={opponentActive} isPlayer={false} isActive={!isPlayerTurn} layout="auto" />
        </div>

        {/* Center strip */}
        <div className="lg:order-2">
          <CenterStrip
            opponent={opponent}
            player={player}
            turnNumber={gameState.turnNumber}
            isPlayerTurn={isPlayerTurn}
            isAIThinking={isAIThinking}
            onSwap={(benchIndex) => handleAction({ type: 'SWAP_UNIT', benchIndex })}
            canSwap={canSwap}
            layout="auto"
          />
        </div>

        {/* Player panel */}
        <div className="flex-1 min-h-0 lg:order-3">
          <FighterPanel unit={playerActive} isPlayer={true} isActive={isPlayerTurn} layout="auto" />
        </div>
      </div>

      {/* Hand drawer */}
      <HandDrawer
        cardIds={player.hand}
        onPlayCard={(cardId) => handleAction({ type: 'PLAY_CARD', cardId })}
        canPlay={canPlayCard}
        disabled={!isPlayerTurn || isAIThinking}
      />

      <div className="h-14 sm:h-16" />

      <ActionBar
        activeUnit={playerActive}
        availableActions={availableActions}
        onAction={handleAction}
        disabled={!isPlayerTurn || isAIThinking}
      />
    </div>
  )
}
