import { useEffect, useRef } from 'react'
import { useGameStore, useAvailableActions } from '../../store/gameStore.ts'
import { getActiveUnit } from '../../engine/GameState.ts'
import { Battlefield } from '../Battle/Battlefield.tsx'
import { InfoBar } from './InfoBar.tsx'
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

  // Track combat log length to fire toasts for new entries
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
      style={{ background: 'radial-gradient(ellipse at center, #141a24 0%, #0a0e14 70%)' }}
    >
      {/* Toast notifications */}
      <ToastContainer />

      {/* Forced Swap Modal */}
      {showForcedSwap && (
        <ForcedSwapModal
          player={player}
          onSelect={(benchIndex) => handleAction({ type: 'FORCED_SWAP', benchIndex })}
        />
      )}

      {/* Opponent info bar */}
      <InfoBar player={opponent} isPlayer={false} />

      {/* Battlefield (fills available space) */}
      <div className="flex-1 flex flex-col justify-center min-h-0">
        <Battlefield
          playerUnit={playerActive}
          opponentUnit={opponentActive}
          turnNumber={gameState.turnNumber}
          isPlayerTurn={isPlayerTurn}
          isAIThinking={isAIThinking}
        />
      </div>

      {/* Player info bar */}
      <InfoBar
        player={player}
        isPlayer={true}
        onSwap={(benchIndex) => handleAction({ type: 'SWAP_UNIT', benchIndex })}
        canSwap={canSwap}
      />

      {/* Hand drawer */}
      <HandDrawer
        cardIds={player.hand}
        onPlayCard={(cardId) => handleAction({ type: 'PLAY_CARD', cardId })}
        canPlay={canPlayCard}
        disabled={!isPlayerTurn || isAIThinking}
      />

      {/* Spacer for sticky action bar */}
      <div className="h-14 sm:h-16" />

      {/* Sticky action bar */}
      <ActionBar
        activeUnit={playerActive}
        availableActions={availableActions}
        onAction={handleAction}
        disabled={!isPlayerTurn || isAIThinking}
      />
    </div>
  )
}
