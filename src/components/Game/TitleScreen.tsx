import { motion } from 'framer-motion'
import { useGameStore } from '../../store/gameStore.ts'

export function TitleScreen() {
  const setScreen = useGameStore((s) => s.setScreen)

  return (
    <div
      className="min-h-[100dvh] flex flex-col items-center justify-center gap-6 sm:gap-8 p-4"
      style={{ background: 'radial-gradient(ellipse at center, #141a24 0%, #0a0e14 70%)' }}
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="text-6xl sm:text-8xl mb-4">💀</div>
        <h1
          className="text-5xl sm:text-7xl font-black tracking-tight"
          style={{
            fontFamily: 'var(--font-display)',
            background: 'linear-gradient(135deg, #ef4444, #f59e0b, #ef4444)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 30px rgba(239,68,68,0.3))',
          }}
        >
          DEAD DROP
        </h1>
        <p className="text-base sm:text-xl text-gray-400 mt-3 sm:mt-4 max-w-md mx-auto tracking-wide" style={{ fontFamily: 'var(--font-body)' }}>
          Gig Workers. Card Battles. No Mercy.
        </p>
        <p className="text-xs sm:text-sm text-gray-600 mt-2 italic">
          Pick your riders, build your deck, outsmart the AI.
        </p>
      </motion.div>

      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => setScreen('team-select')}
        className="px-12 py-4 text-white text-xl sm:text-2xl font-bold rounded-xl transition-all"
        style={{
          fontFamily: 'var(--font-display)',
          background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
          boxShadow: '0 0 40px rgba(220,38,38,0.3), 0 8px 24px rgba(0,0,0,0.4)',
        }}
      >
        PLAY
      </motion.button>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-[11px] sm:text-xs text-gray-700 max-w-sm text-center px-4 leading-relaxed"
      >
        Pokemon-style unit swapping meets Hearthstone mana. Build a team of 3 gig workers, arm them with 15 item cards, and battle!
      </motion.div>
    </div>
  )
}
