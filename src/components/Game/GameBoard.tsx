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
      style={{ background: '#0a0e14' }}
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

      {/* === THE DUEL LAYOUT === */}
      {/* Battlefield fills available space above hand/actions */}
      <div className="flex-1 min-h-0 flex flex-col max-w-2xl mx-auto w-full">
        {/* Opponent art panel */}
        <FighterPanel unit={opponentActive} isPlayer={false} isActive={!isPlayerTurn} />

        {/* Center strip: bench circles + turn + mana */}
        <CenterStrip
          opponent={opponent}
          player={player}
          turnNumber={gameState.turnNumber}
          isPlayerTurn={isPlayerTurn}
          isAIThinking={isAIThinking}
          onSwap={(benchIndex) => handleAction({ type: 'SWAP_UNIT', benchIndex })}
          canSwap={canSwap}
        />

        {/* Player art panel */}
        <FighterPanel unit={playerActive} isPlayer={true} isActive={isPlayerTurn} />
      </div>

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
