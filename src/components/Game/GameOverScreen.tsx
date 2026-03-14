import { motion } from 'framer-motion'
import { useGameStore } from '../../store/gameStore.ts'

export function GameOverScreen() {
  const gameState = useGameStore((s) => s.gameState)
  const resetGame = useGameStore((s) => s.resetGame)

  if (!gameState) return null

  const playerWon = gameState.winner === 'player1'

  return (
    <div
      className="min-h-[100dvh] flex flex-col items-center justify-center gap-4 sm:gap-6 p-4"
      style={{ background: 'radial-gradient(ellipse at center, #141a24 0%, #0a0e14 70%)' }}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 12 }}
        className="text-6xl sm:text-8xl"
      >
        {playerWon ? '🏆' : '💀'}
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-4xl sm:text-6xl font-black"
        style={{
          fontFamily: 'var(--font-display)',
          color: playerWon ? '#facc15' : '#ef4444',
          filter: playerWon ? 'drop-shadow(0 0 30px rgba(250,204,21,0.3))' : 'drop-shadow(0 0 30px rgba(239,68,68,0.3))',
        }}
      >
        {playerWon ? 'VICTORY!' : 'DEFEAT'}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-gray-400 text-sm sm:text-lg text-center"
      >
        {playerWon ? 'You conquered the gig economy!' : 'The gig economy conquered you.'}
      </motion.p>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-gray-600 text-xs sm:text-sm"
      >
        Game lasted {gameState.turnNumber} turns
      </motion.p>

      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.97 }}
        onClick={resetGame}
        className="mt-2 px-10 py-4 text-white text-lg sm:text-xl font-bold rounded-xl transition-all"
        style={{
          fontFamily: 'var(--font-display)',
          background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
          boxShadow: '0 0 40px rgba(220,38,38,0.3), 0 8px 24px rgba(0,0,0,0.4)',
        }}
      >
        Play Again
      </motion.button>
    </div>
  )
}
