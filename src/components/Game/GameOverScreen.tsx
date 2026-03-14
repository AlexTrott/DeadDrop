import { useGameStore } from '../../store/gameStore.ts'

export function GameOverScreen() {
  const gameState = useGameStore((s) => s.gameState)
  const resetGame = useGameStore((s) => s.resetGame)

  if (!gameState) return null

  const playerWon = gameState.winner === 'player1'

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center gap-4 sm:gap-6 p-4">
      <div className="text-6xl sm:text-8xl">{playerWon ? '🏆' : '💀'}</div>
      <h1 className={`text-3xl sm:text-5xl font-black ${playerWon ? 'text-yellow-400' : 'text-red-500'}`}>
        {playerWon ? 'VICTORY!' : 'DEFEAT'}
      </h1>
      <p className="text-gray-400 text-sm sm:text-lg text-center">
        {playerWon ? 'You conquered the gig economy!' : 'The gig economy conquered you.'}
      </p>
      <p className="text-gray-600 text-xs sm:text-sm">
        Game lasted {gameState.turnNumber} turns
      </p>

      <button
        onClick={resetGame}
        className="mt-2 px-8 py-4 min-h-[48px] bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white text-lg sm:text-xl font-bold rounded-xl shadow-2xl transition-all active:scale-95"
      >
        Play Again
      </button>
    </div>
  )
}
